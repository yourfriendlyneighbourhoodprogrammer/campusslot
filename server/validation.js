import { z } from 'zod';
export class AppError extends Error { constructor(status,message){super(message);this.status=status;} }
export const credentials=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(8).max(72)});
export const registration=credentials.extend({name:z.string().trim().min(2).max(60)});
export const resourceInput=z.object({name:z.string().trim().min(3).max(70),category:z.enum(['Study room','Creative space','Equipment']),location:z.string().trim().min(2).max(80),description:z.string().trim().min(10).max(500),capacity:z.number().int().min(1).max(100),features:z.array(z.string().trim().min(1).max(40)).max(8),approvalRequired:z.boolean()});
export const bookingInput=z.object({resource:z.string().regex(/^[a-f\d]{24}$/i),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),hour:z.number().int().min(8).max(19),purpose:z.string().trim().min(5).max(200),attendees:z.number().int().min(1).max(100),waitlist:z.boolean().default(false)});
export function slotTime(date,hour){
 const start=new Date(`${date}T${String(hour).padStart(2,'0')}:00:00+05:30`);
 if(!Number.isFinite(+start)||start.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})!==date)throw new AppError(400,'Choose a valid date.');
 if(+start<=Date.now()||+start>Date.now()+14*86400000)throw new AppError(400,'Choose a future slot within the next 14 days.');
 return start;
}
