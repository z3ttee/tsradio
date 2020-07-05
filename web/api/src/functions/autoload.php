<?php
spl_autoload_register(function($class){
    $class = lcfirst($class).'.class.php';

    if(file_exists('src/exceptions/'.$class)) require_once ('src/exceptions/'.$class);
    else if(file_exists('src/models/'.$class)) require_once ('src/models/'.$class);
});