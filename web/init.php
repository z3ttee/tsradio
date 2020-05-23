<?php
require './vendor/autoload.php';

session_start();

putenv("GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json");