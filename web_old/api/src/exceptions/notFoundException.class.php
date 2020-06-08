<?php
class NotFoundException extends Exception {
    public function __construct(string $message = "Unknown 404") {
        parent::__construct($message, 0, null);
    }
}