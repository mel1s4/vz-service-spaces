<?php 
  $cookie_uid = '';
  if (isset($_COOKIE['vz_space_uid'])) {
    $cookie_uid = $_COOKIE['vz_space_uid'];
  }
  $plugin_dir = plugin_dir_url(__FILE__);
  $real_uid = get_post_meta(get_the_ID(), 'vz_service_space_uid', true);
  $is_admin = current_user_can('edit_posts');
  $uid = $is_admin ? $real_uid : $cookie_uid;
  if (!$is_admin && (!$cookie_uid || $real_uid != $cookie_uid)) {
    wp_redirect(home_url());
  }
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>
    <?php echo get_the_title() ?>
  </title>
  <link rel="stylesheet" href="<?php echo $plugin_dir .  'single/build/static/css/main.css' ?>">
  <script>
    window.vz_service_space_uid = `<?php echo $uid ?>`;
    window.vz_service_space_values = JSON.parse(`<?php echo JSON_ENCODE(vz_service_space_details($uid)) ?>`);
    window.vz_service_space_is_admin = `<?php echo $is_admin ?>`;
    window.vz_service_space_nonce = `<?php echo wp_create_nonce('wp_rest') ?>`;
    window.vz_ss_blog_url = `<?php echo get_bloginfo('url') ?>`;
  </script>
</head>
<body id="root">
  <h1>
    Loading...
  </h1>
</body>
  <script src="<?php echo $plugin_dir . 'single/build/static/js/main.js' ?>" defer>
  </script>
</html>