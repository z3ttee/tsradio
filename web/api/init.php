<? 
require '../vendor/autoload.php';
require_once 'src/functions/autoload.php';

putenv("GOOGLE_APPLICATION_CREDENTIALS=../serviceAccount.json");

header('Content-Type: application/json');

define('APP_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('APP_URL', str_replace($_SERVER['DOCUMENT_ROOT'], '', $_SERVER["REQUEST_SCHEME"] . '://' . $_SERVER['HTTP_HOST'] . (dirname($_SERVER['PHP_SELF']) === DIRECTORY_SEPARATOR ? '' : dirname($_SERVER['PHP_SELF'])) . '/'));
define('APP_QUERY', array_filter(explode("/", $_SERVER['QUERY_STRING']), function($var){
    return $var != "";
}));

$response = array();
$response['meta'] = array('status' => 200, 'message' => 'OK');
$response['payload'] = array();

set_exception_handler(function($exception){
    $response['meta']['status'] = 400;
    $response['meta']['message'] = $exception->getMessage();
    
    if($exception instanceof EndpointNotFoundException) {
        $response['meta']['status'] = 404;
    }
    if($exception instanceof NotFoundException) {
        $response['meta']['status'] = 404;
    }

    echo json_encode($response);
    die;
});

set_error_handler(function($errorCode, $errorText, $errorFile, $errorLine){
    $response['meta']['status'] = 400;
    $response['meta']['message'] = $errorText;
    echo json_encode($response);
    die;
}, E_ALL ^ E_USER_DEPRECATED);

$q = array(); 
$m = $_SERVER['REQUEST_METHOD'];

if($m === 'POST') {
    $q = $_POST;
} else if($m === 'GET') {
    $q = $_GET;
}

$database = new Google\Cloud\Firestore\FirestoreClient();
$request = new Request($m, APP_QUERY, $q, $database);