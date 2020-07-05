<?php
class VersionRequiredException extends Exception {
    public function __construct() {
        parent::__construct('API Version is required', 0, null);
    }
}