<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

$secretKey = "6LcerCwrAAAAAC3QADdWgfyuxWFUlq_dGSTtAiQ6";
$token = $_POST['recaptcha_token'];
            
$contact_name = trim($_POST['contact-name']);
$contact_surname = trim($_POST['contact-surname']);
$contact_entreprise = trim($_POST['contact-entreprise']);
$contact_mail = trim($_POST['contact-mail']);
$contact_phone = trim($_POST['contact-phone']);
$interest = trim($_POST['interest']);
$who_you_are = trim($_POST['who_you_are']);
$contact_message = trim($_POST['contact-message']);

$mail_subject= 'Contact website sent :'. date("Y-m-d h:i");
$mail_subject= utf8_decode($mail_subject);

$mail_txt= '***Mail sent from website *** <br>'.'<br> <b>Nom : </b>'.$contact_name.'<br> <b>Prénom: </b> '.$contact_surname.'<br><br> <b>Entrepise:</b> '.$contact_entreprise.'<br><br> <b> Mail:</b>  '.$contact_mail.'<br> <b> Phone: </b> '.$contact_phone.'<br><br><b> Votre secteur: </b> '.$interest.'<br> <br><b> Qui vous êtes : </b> '.$who_you_are.'<br><br> <b> Besoin : </b> <br>'.$contact_message;
$mail_txt= utf8_decode($mail_txt);
 
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
    $mail->Subject = $mail_subject;
    $mail->Body    = $mail_txt;//'This email was sent using <b>Gmail SMTP server</b> and PHPMailer.';
    $mail->AltBody = $mail_txt;//'This email was sent using Gmail SMTP server and PHPMailer.';

    $mail->send();
    //echo 'Message has been sent successfully.';
	header('Location: ../contact_result.php?status=OK');
    exit;
	
} 	catch (Exception $e) {
    //echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
	header('Location: .../contact_result.php?status=NO');
    exit;
	
}


	
	/*End Send mail*/
	
	
	
} else {
    // Possibly a bot
    //echo "reCAPTCHA verification failed.";
	header('Location: ../contact_result.php?status=NO');
    exit;
	
}
?>
