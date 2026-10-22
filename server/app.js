import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { User, Resource, Booking, Notification } from './models.js';
import { auth, manager, createSession, logout, publicUser } from './auth.js';
import { credentials, registration, resourceInput, bookingInput, AppError } from './validation.js';
import { reserve, transition } from './bookings.js';
export function createApp(){
 const app=express();app.disable('x-powered-by');app.set('trust proxy',1);
 app.use(helmet(),express.json({limit:'16kb'}),cookieParser());
 app.use('/api',rateLimit({windowMs:60000,limit:200,standardHeaders:'draft-8',legacyHeaders:false}));
 // Same-origin production hosting and a Vite development proxy avoid cross-site cookies.
 app.use('/api',(req,res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin&&req.headers.origin!==process.env.APP_ORIGIN)throw new AppError(403,'Request origin is not allowed.');next();});
 app.get('/api/health',(req,res)=>res.status(mongoose.connection.readyState===1?200:503).json({ok:mongoose.connection.readyState===1}));
 const loginLimit=rateLimit({windowMs:15*60000,limit:30,standardHeaders:'draft-8',legacyHeaders:false});
 app.post('/api/auth/register',loginLimit,async(req,res)=>{const data=registration.parse(req.body);const user=await User.create({...data,password:await bcrypt.hash(data.password,12),role:'student'});await createSession(user,res);res.status(201).json(publicUser(user));});
 app.post('/api/auth/login',loginLimit,async(req,res)=>{const data=credentials.parse(req.body);const user=await User.findOne({email:data.email}).select('+password');if(!user||!await bcrypt.compare(data.password,user.password))throw new AppError(401,'Email or password is incorrect.');await createSession(user,res);res.json(publicUser(user));});
 app.get('/api/auth/me',auth,(req,res)=>res.json(publicUser(req.user)));
 app.post('/api/auth/logout',auth,logout);
 app.get('/api/resources',async(req,res)=>{
  const filter={active:true};if(req.query.category&&req.query.category!=='All')filter.category=String(req.query.category);
  if(req.query.q){const escaped=String(req.query.q).slice(0,80).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');filter.$or=[{name:{$regex:escaped,$options:'i'}},{location:{$regex:escaped,$options:'i'}}];}
  res.json(await Resource.find(filter).sort({name:1}).limit(100));
 });
 app.get('/api/resources/:id/slots',async(req,res)=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(req.query.date||''))throw new AppError(400,'A valid date is required.');
  const from=new Date(`${req.query.date}T00:00:00+05:30`);if(!Number.isFinite(+from))throw new AppError(400,'Invalid date.');
  const bookings=await Booking.find({resource:req.params.id,start:{$gte:from,$lt:new Date(+from+86400000)},live:true}).select('start status active');
  res.json(Array.from({length:12},(_,i)=>{const hour=i+8;const start=new Date(`${req.query.date}T${String(hour).padStart(2,'0')}:00:00+05:30`);const same=bookings.filter(b=>+b.start===+start);return {hour,start,occupied:same.some(b=>b.active),waiting:same.filter(b=>b.status==='waitlisted').length,past:+start<=Date.now()};}));
 });
 app.get('/api/bookings',auth,async(req,res)=>res.json(await Booking.find({user:req.user._id}).populate('resource').sort({start:-1}).limit(200)));
 app.post('/api/bookings',auth,async(req,res)=>res.status(201).json(await reserve(req.user._id,bookingInput.parse(req.body))));
 app.post('/api/bookings/:id/cancel',auth,async(req,res)=>res.json(await transition(req.user,req.params.id,'cancel')));
 app.get('/api/notifications',auth,async(req,res)=>res.json(await Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(50)));
 app.post('/api/notifications/read',auth,async(req,res)=>{await Notification.updateMany({user:req.user._id,read:false},{$set:{read:true}});res.json({ok:true});});
 app.get('/api/manage',auth,manager,async(req,res)=>{const [resources,bookings]=await Promise.all([Resource.find().sort({name:1}),Booking.find().populate('resource').populate('user','name email').sort({createdAt:-1}).limit(200)]);res.json({resources,bookings});});
 app.post('/api/manage/resources',auth,manager,async(req,res)=>res.status(201).json(await Resource.create(resourceInput.parse(req.body))));
 app.patch('/api/manage/resources/:id',auth,manager,async(req,res)=>{
  if(typeof req.body.active!=='boolean')throw new AppError(400,'active must be a boolean.');
  const r=await Resource.findByIdAndUpdate(req.params.id,{$set:{active:req.body.active},$inc:{revision:1}},{new:true});if(!r)throw new AppError(404,'Resource not found.');res.json(r);
 });
 app.post('/api/manage/bookings/:id/:action',auth,manager,async(req,res)=>{
  if(!['approve','reject'].includes(req.params.action))throw new AppError(400,'Invalid action.');
  if(typeof req.body.note!=='string'||req.body.note.length>200)throw new AppError(400,'Include a note of up to 200 characters.');
  if(req.params.action==='reject'&&req.body.note.trim().length<3)throw new AppError(400,'Please explain the rejection.');
  res.json(await transition(req.user,req.params.id,req.params.action,req.body.note.trim()));
 });
 app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint not found.'}));
 const dist=path.resolve('dist');if(existsSync(dist)){app.use(express.static(dist));app.get('/{*path}',(req,res)=>res.sendFile(path.join(dist,'index.html')));}
 app.use((error,req,res,next)=>{
  if(error.name==='ZodError')return res.status(400).json({error:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')});
  if(error.code===11000)return res.status(409).json({error:'This account or reservation already exists. Refresh and try again.'});
  if(error.name==='CastError')return res.status(400).json({error:'Invalid identifier.'});
  const status=error.status||500;if(status>=500)console.error('Request failed:',error.name);
  res.status(status).json({error:status<500?error.message:'Something went wrong. Please try again.'});
 });return app;
}
