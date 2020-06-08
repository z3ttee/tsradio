<?php
class MissingParamsException extends Exception {
    public function __construct(array $missingParams = array()) {
        parent::__construct('Missing some parameters: '.implode(",",$missingParams), 0, null);
    }
}