<?php
class EndpointNotFoundException extends Exception {
    public function __construct() {
        parent::__construct('Invalid endpoint', 0, null);
    }
}