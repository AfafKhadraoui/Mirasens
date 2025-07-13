<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);






$secretKey = "6LcerCwrAAAAAC3QADdWgfyuxWFUlq_dGSTtAiQ6";
$token = $_POST['recaptcha_token'];
 
$response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$token");
$responseData = json_decode($response);

if ($responseData->success && $responseData->score >= 0.5) {
    // Human - process the form
    echo "Form submitted successfully!";
	
	//Start Send mail
	   

		$mail = new PHPMailer(true);

		try {
     // Paramètres du serveur SMTP
    $mail->isSMTP();
    $mail->Host       = 'mail.infomaniak.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contact@mirasens.com';
    $mail->Password   = 'yAE70t6z_j6E$#';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Utilisez PHPMailer::ENCRYPTION_SMTPS pour le port 465
    $mail->Port       =  465 ;

    // Sender and recipient
    $mail->setFrom('contact@mirasens.com', 'MIRASENS Contact');
    $mail->addAddress('contact@mirasens.com', 'MIRASENS ContactForm');

    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'Gmail SMTP Test';
    $mail->Body    = 'This email was sent using <b>Gmail SMTP server</b> and PHPMailer.';
    $mail->AltBody = 'This email was sent using Gmail SMTP server and PHPMailer.';

    $mail->send();
    echo 'Message has been sent successfully.';
} 	catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}


	
	/*End Send mail*/
	
	
	
} else {
    // Possibly a bot
    echo "reCAPTCHA verification failed.";
}
?>
