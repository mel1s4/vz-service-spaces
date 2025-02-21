<?php 
if (is_admin()) return;
if (isset($_COOKIE['vz_space_uid'])) {
  $space_uid = $_COOKIE['vz_space_uid'];
} else if (isset($_GET['vz_space_uid'])) {
  $space_uid = $_GET['vz_space_uid'];
} else {
  return;
}

$space_id = vz_get_space_by_uid($space_uid);
if (!$space_id) return;
// $user_id = isset($_COOKIE['vz_space_user_id']) ? $_COOKIE['vz_space_user_id'] : 'Guest';

?>

<div id='vz-service-spaces-footer'>
  <a class="vz-ss-link" href="<?php echo get_the_permalink($space_id) ?>"> <?php echo get_the_title($space_id) ?> </a>
  <button id='vz-service-spaces-logout'> Salir </button>
</div>

<script>
  document.getElementById('vz-service-spaces-logout').addEventListener('click', function() {
    if ( !confirm('Desea salir de la mesa?') ) return;
    document.cookie = 'vz_space_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'vz_space_user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // remove vz_space_uid from the url variables
    url = window.location.href;
    url = url.split('?')[0];
    window.location.href = url;
  });
</script>
