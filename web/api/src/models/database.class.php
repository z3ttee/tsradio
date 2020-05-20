<?php
class Database {
    private static $_instance = null;

    private function __construct(){
        echo 'Constructed';
    }

    public static function getInstance(){
        if(self::$_instance == null){
            self::$_instance = new Database();
        }

        return self::$_instance;
    }
}