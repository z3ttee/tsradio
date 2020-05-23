<?
session_start();
require_once 'init.php';
include $request->getMethodFile();
echo "Def";
$response['test'] = "test";
echo json_encode($response);