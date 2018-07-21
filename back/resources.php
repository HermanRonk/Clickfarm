<?php

// Ophalen variabelen uit post
$resource = $_POST["res"];
$amount = $_POST["amount"];


if (!isset($objResponse)) $objResponse = new stdClass();

// Functie voor optellen verbruik / verkoop in centrale DB
function sqlSave($resource, $amount) {
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
    
    $stmt = $conn->prepare("UPDATE resources SET Amount = amount + ? WHERE ResType = ?");

    $stmt->bind_param("ss", $amount, $resource);
    $stmt->execute();
    $stmt->close();
    
};

sqlSave($resource, $amount);


?>
