// // @deno-types="https://deno.land/std@0.168.0/http/server.ts"
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
// };

// interface Profile {
//   id: string;
//   email: string;
//   full_name?: string;
//   business_name?: string;
//   industry?: string;
//   cell_number?: string;
//   location?: string;
//   business_challenge?: string;
//   created_at: string;
// }

// serve(async (req: Request) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   try {
//     const payload = await req.json();
//     console.log('Full webhook payload:', JSON.stringify(payload, null, 2));
    
//     // Handle different webhook payload formats
//     let profile: Profile;
    
//     if (payload.record) {
//       // Supabase webhook format
//       profile = payload.record;
//     } else if (payload.type === 'INSERT' && payload.table === 'profiles') {
//       // Alternative webhook format
//       profile = payload.new || payload.record;
//     } else {
//       // Direct payload (for testing or direct calls)
//       profile = payload;
//     }
    
//     if (!profile || !profile.id) {
//       console.error('Invalid payload structure:', payload);
//       throw new Error('Invalid webhook payload - no profile data found');
//     }
    
//     const userId = profile.id;
//     console.log('Processing registration for user:', userId);

//     // Send email via Resend
//     const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
//     if (!RESEND_API_KEY) {
//       throw new Error('RESEND_API_KEY not configured');
//     }

//     const emailPayload = {
//       from: 'Lester Philander <info@corpradio.online>',
//       to: 'info@lesterphilander.com',
//       subject: '🎉 New User Registration - Lester Philander Site',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
//           <div style="background-color: #0B1F3B; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
//             <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New User Registration</h1>
//           </div>
          
//           <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//             <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
//               A new user has registered on your website!
//             </p>

//             <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//               <table style="width: 100%; border-collapse: collapse;">
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight: bold; width: 40%;">Full Name:</td>
//                   <td style="padding: 10px 0; color: #333;">${profile.full_name || 'Not provided'}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight: bold;">Email:</td>
//                   <td style="padding: 10px 0; color: #333;">${profile.email}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight: bold;">Business Name:</td>
//                   <td style="padding: 10px 0; color: #333;">${profile.business_name || 'Not provided'}</td>
//                 </tr>
//                 ${profile.industry ? `
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight: bold;">Industry:</td>
//                   <td style="padding: 10px 0; color: #333;">${profile.industry}</td>
//                 </tr>
//                 ` : ''}
//                 ${profile.cell_number ? `
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight: bold;">Cell Number:</td>
//                   <td style="padding: 10px 0; color: #333;">${profile.cell_number}</td>
//                 </tr>
//                 ` : ''}
//                 ${profile.location ? `
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight bold;">Location:</td>
//                   <td style="padding: 10px 0; color: #333;">${profile.location}</td>
//                 </tr>
//                 ` : ''}
//                 <tr>
//                   <td style="padding: 10px 0; color: #666; font-weight: bold;">Registration Date:</td>
//                   <td style="padding: 10px 0; color: #333;">${new Date(profile.created_at).toLocaleString()}</td>
//                 </tr>
//               </table>
//             </div>

//             ${profile.business_challenge ? `
//             <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
//               <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">Business Challenge:</p>
//               <p style="margin: 0; color: #856404; line-height: 1.6;">${profile.business_challenge}</p>
//             </div>
//             ` : ''}

//             <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
//               <p style="color: #666; font-size: 14px; margin: 0;">
//                 <strong>User ID:</strong> ${userId}
//               </p>
//             </div>
//           </div>

//           <div style="text-align: center; margin-top: 20px; padding: 20px;">
//             <p style="color: #999; font-size: 12px; margin: 0;">
//               This is an automated notification from Lester Philander website.
//             </p>
//           </div>
//         </div>
//       `
//     };

//     console.log('Sending registration email...');

//     const emailResponse = await fetch('https://api.resend.com/emails', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${RESEND_API_KEY}`
//       },
//       body: JSON.stringify(emailPayload)
//     });

//     const emailData = await emailResponse.json();
//     console.log('Resend response:', emailData);

//     if (!emailResponse.ok) {
//       throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: 'Registration email sent successfully',
//         emailId: emailData.id
//       }),
//       {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 200
//       }
//     );

//   } catch (error) {
//     console.error('Error:', error);
    
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
//     return new Response(
//       JSON.stringify({
//         error: errorMessage,
//         details: 'Check function logs for more information'
//       }),
//       {
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 400
//       }
//     );
//   }
// });


// supabase/functions/send-registration-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Fetching profile for user:', userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    console.log('Profile fetched:', profile);

    // Send email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailPayload = {
      from: 'Corp Radio <info@corpradio.online>',
      to: 'design@nicolephilander.co.za',
      subject: '🎉 New User Registration - Corp Radio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #001F3F; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New User Registration</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
              A new user has registered on Corp Radio!
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold; width: 40%;">Full Name:</td>
                  <td style="padding: 10px 0; color: #333;">${profile.full_name || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Email:</td>
                  <td style="padding: 10px 0; color: #333;">${profile.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Business Name:</td>
                  <td style="padding: 10px 0; color: #333;">${profile.business_name || 'Not provided'}</td>
                </tr>
                ${profile.industry ? `
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Industry:</td>
                  <td style="padding: 10px 0; color: #333;">${profile.industry}</td>
                </tr>
                ` : ''}
                ${profile.cell_number ? `
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Cell Number:</td>
                  <td style="padding: 10px 0; color: #333;">${profile.cell_number}</td>
                </tr>
                ` : ''}
                ${profile.location ? `
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Location:</td>
                  <td style="padding: 10px 0; color: #333;">${profile.location}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Registration Date:</td>
                  <td style="padding: 10px 0; color: #333;">${new Date(profile.created_at).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            ${profile.business_challenge ? `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">Business Challenge:</p>
              <p style="margin: 0; color: #856404; line-height: 1.6;">${profile.business_challenge}</p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>User ID:</strong> ${userId}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated notification from Corp Radio.
            </p>
          </div>
        </div>
      `
    };

    console.log('Sending registration email...');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emailPayload)
    });

    const emailData = await emailResponse.json();
    console.log('Resend response:', emailData);

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration email sent successfully',
        emailId: emailData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: 'Check function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});