<?php

// Ophalen variabelen uit post
$uid = $_POST["id"];
$type_transaction = $_POST["type"];
$savegame = $_POST["savegame"];

// Zetten overige variabelen
$dateNow = date('D M d Y H:i:s O');
$type_string = strlen($uid);
if (!isset($objResponse)) $objResponse = new stdClass();

if ($uid == 'undefined') {
    exit(1);
}

// Genereren 8 teken lange save id (wordt gebruikt in combinatie met user id)
function generateRandomString($length = 8) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

// Functie voor het OPHALEN van savegames
function sqlGet($saveGameID){
    if (!isset($objResponse)) $objResponse = new stdClass();
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

    // Splitsen savaGameID string
    $guidUser =  substr($saveGameID,0 ,-9);
    $sgID = substr($saveGameID, -8);

    // Ophalen save
    $stmt_update = $conn->prepare("SELECT savegame, persistent FROM saves WHERE user=? AND saveid=?");
    $stmt_update->bind_param("ss", $guidUser, $sgID);
    $stmt_update->execute();
    $stmt_update->bind_result($savegame, $persistent);

    // Object aanvullen
    while ($stmt_update->fetch()) {
        $objResponse->saveGame = $savegame;
        $objResponse->typeSave = $persistent;
    }
    $stmt_update->close();
    $objResponse->_id = $uid;
    $objResponse->_debug = "ophalen save";
    
    // Resultaat terug sturen
    $responseJSON = json_encode($objResponse);
    header('Content-Type: application/json');
    echo $responseJSON;
    
}

// Functie voor OPSLAAN savegames
function sqlSave($uid, $savegame, $type_transaction, $legacy) {
    if (!isset($objResponse)) $objResponse = new stdClass();
    // Type save bepalen
    if ($type_transaction == "save_pers") {
        $tt = 1;
    } else {
        $tt = 0;
    }

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
    
    if ($tt == 1) {
        // Betreft opslaan persistent save
        $rs = generateRandomString();
        $stmt = $conn->prepare("INSERT INTO saves (user, savegame, persistent, saveid, modified) VALUES (?, ?, ?, ?, NOW())");
        $stmt->bind_param("ssis", $uid, $savegame, $tt, $rs);
        $stmt->execute();
        $stmt->close();
        $saveIDDummy = $uid."-".$rs;
        $objResponse->_id = $uid;
        $objResponse->_saveid = $uid."-".$rs;
        $objResponse->_debug = "Pers save";
    } else {
        // Betreft een nieuwe save of bijwerken bestaande save
        // save zoeken
        $stmt_count = $conn->prepare("SELECT user FROM saves WHERE user = ? && persistent= 0");
        $stmt_count->bind_param("s", $uid);
        $stmt_count->execute();
        $result = $stmt_count->get_result();
        $rowcount=mysqli_num_rows($result);

        if ($rowcount == 0) {
            // Initiele save
            $stmt = $conn->prepare("INSERT INTO saves (user, savegame, persistent, modified) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param("ssi", $uid, $savegame, $tt);
            $stmt->execute();
            $stmt->close();
            $objResponse->_id = $uid;
            $objResponse->_debug = "init save";
        } elseif ($rowcount == 1) {
            // Reguliere save
            $stmt_update = $conn->prepare("UPDATE saves SET savegame=?, modified=NOW() WHERE user=? && persistent= 0");
            $stmt_update->bind_param("ss", $savegame, $uid);
            $stmt_update->execute();
            $stmt_update->close();
            $objResponse->_id = $uid;
            $objResponse->_debug = "reguliere save";
        } 
    }

    if ($legacy == 0) {
        // Resultaat terug sturen naar JS
        $responseJSON = json_encode($objResponse);
        header('Content-Type: application/json');
        echo $responseJSON;
    } else {
        return $saveIDDummy;
    }
    
}

// Werkelijjke handelingen

if ($type_string < 30  && $type_transaction == 'restore') {
    // Herstellen van een savegame id (tijdelijk)
    $curl = curl_init();

    curl_setopt_array($curl, array(
    CURLOPT_URL => "https://market.clickfarm.nl/tasks/".$uid,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => array(
        "Cache-Control: no-cache",
        "Content-Type: application/x-www-form-urlencoded",
    ),
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
    echo "cURL Error #:" . $err;
    } else {
        $old_array = json_decode($response, true);
        $saveIDDummy = sqlSave($old_array['userId'], $old_array['saveGame'], 'save_pers', 1);
        sqlGet($saveIDDummy);
    }

} else {
    // Reguliere afhandeling transacties
    switch ($type_transaction) {
        case 'restore':
        // Ophalen savegame
        $objResponse = sqlGet($uid);
        break;
        default:
        // Opslaan savegame (zowel peridoek als persistent, afhandeling in functie)
        $objResponse = sqlSave($uid, $savegame, $type_transaction, 0);
        break;
    }
}


?>

