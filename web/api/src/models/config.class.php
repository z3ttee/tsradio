<?php
class Config {
    public static function get(string $path = ''){
        $parts = explode('/', $path);
        $config = self::getArray();
        
        foreach($parts as $bit){
            if(isset($config[$bit])){
                $config = $config[$bit];
            }
        }

        return $config;
    }
    public static function getArray(){
        return APP_CONFIG;
    }
}
?>