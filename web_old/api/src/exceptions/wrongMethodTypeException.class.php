<?php
class WrongMethodTypeException extends Exception {
    public function __construct() {
        parent::__construct('Wrong method type for this endpoint', 0, null);
    }
}