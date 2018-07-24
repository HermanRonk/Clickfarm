<?php

// Ophalen variabelen uit post
$resource = $_POST["res"];
$amount = $_POST["amount"];
$req_type = $_POST["req"];

// DB Variabelen:
$servername = "";
$username = "";
$password = "";
$dbname = "";

if (!isset($objResponse)) $objResponse = new stdClass();

// Bepalen welke actie er uitgevoerd moet worden
if ($req_type == "update") {
    // Updaten waarde database   
    sqlSave($resource, $amount);
} else {
    // Ophalen waardes uit database
    sqlGet($resource);
}

// Functie voor optellen verbruik / verkoop in centrale DB
function sqlSave($resource, $amount) {
    global $servername, $username, $password, $dbname;
    if (!isset($objResponse)) $objResponse = new stdClass();
    
    //DB Connectie
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 
    
    $stmt = $conn->prepare("UPDATE resources SET Amount = amount + ? WHERE ResType = ?");

    $stmt->bind_param("is", $amount, $resource);
    $stmt->execute();
    $stmt->close();
    
};

// Functie voor het ophalen van gegevens uit de DB
function sqlGet() {
    global $servername, $username, $password, $dbname;
    if (!isset($objResponse)) $objResponse = new stdClass();

    //DB Connectie
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 

    // Prepared statement voor ophalen data
    $stmt_get = $conn->prepare("SELECT Amount, ResType FROM resources");
    $stmt_get->execute();
    $stmt_get->bind_result($res_amount, $res_type);

    // Object aanvullen
    while ($stmt_get->fetch()) {
        $objResponse->$res_type  = $res_amount;
    }
    $stmt_get->close();
    $objResponse->_debug = "ophalen amount uit resources";
    
    // Resultaat terug sturen
    $responseJSON = json_encode($objResponse);
    header('Content-Type: application/json');
    echo $responseJSON;
    
};

?>
