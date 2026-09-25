import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const EmailSender = async (
  toEmail,
  titleMovie,
  image_url,
  seatNumber,
  showtimeDate,
  startTime
) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: toEmail,
    subject: "Reservation Confirmation 🎬",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px; background-color:#f9f9f9;">
        <h1 style="color:#E50914; text-align:center;">Reservation Confirmed!</h1>
        <p style="text-align:center;">Thank you for booking with <strong>Super Web Application Cinema</strong> 🍿</p>
        <h2 style="text-align:center; color:#333;">${titleMovie}</h2>
       <img src="${image_url}" alt="${titleMovie}" style="width:100%; max-width:300px; display:block; margin:0 auto 20px; border-radius:8px;" />
        <ul style="list-style:none; padding:0; color:#555; font-size:16px;">
          <li><b>Seat:</b> ${seatNumber}</li>
          <li><b>Date:</b> ${showtimeDate}</li>
          <li><b>Time:</b> ${startTime}</li>
        </ul>
        <p style="text-align:center; margin-top:30px; color:#777;">Enjoy the movie and have a great time!</p>
        <p style="text-align:center; font-size:12px; color:#aaa;">This is an automated email from Super Cinema. Please do not reply.</p>
      </div>
    `,
  })
}