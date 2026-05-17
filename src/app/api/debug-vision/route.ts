import { NextResponse } from 'next/server'; 
  
 export async function GET() { 
   const apiKey = process.env.GEMINI_API_KEY?.trim(); 
    
   if (!apiKey) { 
     return NextResponse.json({  
       status: 'FAIL',  
       reason: 'GEMINI_API_KEY is missing from environment variables'  
     }); 
   } 
  
   try { 
     const response = await fetch( 
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, 
       { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ 
           contents: [{ role: 'user', parts: [{ text: 'Say OK' }] }], 
           generationConfig: { maxOutputTokens: 10 }, 
         }), 
       } 
     ); 
  
     const data = await response.json(); 
  
     if (!response.ok) { 
       return NextResponse.json({  
         status: 'FAIL',  
         httpStatus: response.status, 
         geminiError: data  
       }); 
     } 
  
     return NextResponse.json({  
       status: 'OK',  
       model: 'gemini-1.5-flash', 
       response: data?.candidates?.[0]?.content?.parts?.[0]?.text  
     }); 
  
   } catch (err: any) { 
     return NextResponse.json({  
       status: 'CRASH',  
       error: err.message  
     }); 
   } 
 } 
