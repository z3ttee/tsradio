<?php
session_start();
require_once 'init.php';
include $request->getMethodFile();
echo json_encode($response, JSON_PRETTY_PRINT, 5);