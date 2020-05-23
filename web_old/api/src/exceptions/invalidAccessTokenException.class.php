<?php
class InvalidAccessTokenException extends Exception {
    public function __construct() {
        parent::__construct('Invalid access token found', 0, null);
    }
}