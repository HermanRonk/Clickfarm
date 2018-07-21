<?php

// Ophalen variabelen uit post
$uid = $_POST["id"];
$type_transaction = $_POST["type"];
$amount = $_POST["amount"];
$profit = $_POST["profit"];

// Zetten overige variabelen
$dateNow = date('D M d Y H:i:s O');
$type_string = strlen($uid);
if (!isset($objResponse)) $objResponse = new stdClass();

// Functie voor OPSLAAN savegames
function sqlSave($uid, $profit, $type_transaction, $amount) {
    if (!isset($objResponse)) $objResponse = new stdClass();
    // Type save bepalen

    //DB Connectie gegevens
    $servername = "";
    $username = "";
    $password = "";
    $dbname = "";
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 
    

    // Betreft opslaan persistent save
    $stmt = $conn->prepare("INSERT INTO sales (user, item, profit, amount) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sisi", $uid, $type_transaction, $profit, $amount);
    $stmt->execute();
    $stmt->close();
    
};

sqlSave($uid, $profit, $type_transaction, $amount);


?>
