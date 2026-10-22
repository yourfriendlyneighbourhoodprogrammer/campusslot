import bcrypt from 'bcryptjs';
import { Resource, User } from './models.js';
const resources=[
 ['The Reading Room','Study room','Library · Ground floor',6,'A quiet corner for focused study, revision sessions, and getting that group assignment over the line.',['Whiteboard','Power outlets','Quiet zone'],false],
 ['Collaboration Studio','Study room','Academic block · Room 204',12,'Bring your team together for a project sprint or a big idea. Flexible seating and a wall-sized whiteboard.',['Display screen','Whiteboard','Wi-Fi'],false],
 ['Podcast Corner','Creative space','Student centre · First floor',4,'A small recording space for your next campus story, interview, or student podcast.',['Microphones','Sound treatment','Headphones'],true],
 ['DSLR Camera Kit','Equipment','Media desk · Student centre',2,'Capture your club event or film a project demo. Includes a camera, tripod and standard lens.',['Tripod','18–55mm lens','Carry case'],true],
 ['Innovation Lab','Creative space','Engineering block · Room 108',8,'A practical workspace for prototyping, club workshops and collaborative design.',['Workbench','Projector','Whiteboard'],true],
 ['Portable Projector','Equipment','Library · Help desk',1,'Make your next presentation easy. A portable projector with HDMI cable and a compact travel case.',['HDMI cable','1080p','Carry case'],false]
];
export async function seedResources(){for(const [name,category,location,capacity,description,features,approvalRequired] of resources)await Resource.updateOne({name},{$setOnInsert:{name,category,location,capacity,description,features,approvalRequired}},{upsert:true});}
export async function seedUser(name,email,password,role){let user=await User.findOne({email});if(!user)user=await User.create({name,email,password:await bcrypt.hash(password,12),role});return user;}
