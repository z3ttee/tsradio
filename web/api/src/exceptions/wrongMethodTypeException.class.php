<?php
class WrongMethodTypeException extends Exception {
    public function __construct(string $needed='GET') {
        parent::__construct('Wrong method type for this endpoint. '.$needed, 0, null);
    }
}