import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name, required: true });
const userSchema = new Schema({name:String,email:{type:String,unique:true},password:{type:String,select:false},role:{type:String,enum:['student','manager'],default:'student'}},{timestamps:true});
export const User = model('User',userSchema);
export const Session = model('Session',new Schema({tokenHash:{type:String,unique:true},user:ref('User'),expiresAt:{type:Date,index:{expires:0}}}));
export const Resource = model('Resource',new Schema({name:String,category:{type:String,enum:['Study room','Creative space','Equipment']},location:String,description:String,capacity:Number,features:[String],approvalRequired:Boolean,active:{type:Boolean,default:true},revision:{type:Number,default:0}},{timestamps:true}));
const bookingSchema = new Schema({user:ref('User'),resource:ref('Resource'),start:Date,purpose:String,attendees:Number,status:{type:String,enum:['confirmed','pending','waitlisted','cancelled','rejected']},active:Boolean,live:Boolean,note:{type:String,default:''}},{timestamps:true});
// Pending requests hold a slot. Unique indexes are the final concurrency guard.
bookingSchema.index({resource:1,start:1},{unique:true,partialFilterExpression:{active:true}});
bookingSchema.index({user:1,resource:1,start:1},{unique:true,partialFilterExpression:{live:true}});
export const Booking = model('Booking',bookingSchema);
export const Notification = model('Notification',new Schema({user:ref('User'),message:String,read:{type:Boolean,default:false}},{timestamps:true}));
export async function initIndexes(){await Promise.all([User,Session,Resource,Booking,Notification].map(m=>m.init()));}
