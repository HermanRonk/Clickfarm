<?php

// Antwoord
$objResponse = new stdClass();

// Ophalen variabelen uit POST
if (isset($_POST['res'])) $resource = $_REQUEST['res']; else $resource = '';
if (isset($_POST['amount'])) $amount = $_REQUEST['amount']; else $amount = 0;
if (isset($_POST['req'])) $req_type = $_REQUEST['req']; else $req_type = '';

// DB Variabelen:
require_once('config.php');

//DB Connectie
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}



// Bepalen welke actie er uitgevoerd moet worden
if ($req_type == "update") {
    // Updaten waarde database   
    sqlSave($resource, $amount);
} else {
    // Ophalen waardes uit database
    sqlGet();
}

// Resultaat terug sturen
$responseJSON = json_encode($objResponse);
header('Content-Type: application/json');
echo $responseJSON;

// Functie voor optellen verbruik / verkoop in centrale DB
function sqlSave($resource, $amount) {
    global $conn, $objResponse;

    $stmt = $conn->prepare("UPDATE resources SET Amount = amount + ? WHERE ResType = ?");

    $stmt->bind_param("is", $amount, $resource);
    $stmt->execute();
    $stmt->close();

    // Haal nieuwe waardes op
    sqlGet();
    
};

// Functie voor het ophalen van gegevens uit de DB
function sqlGet() {
    global $conn, $objResponse;

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
};

?>
