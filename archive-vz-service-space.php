<?php
  $plugin_dir = plugin_dir_url(__FILE__);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Spaces</title>
  <link rel="stylesheet" href="<?php echo $plugin_dir .  'archive/build/static/css/main.css' ?>">
  <script>
    window.vz_service_spaces = JSON.parse(`<?php echo JSON_ENCODE(vz_ss_get_service_spaces()) ?>`);
    window.vz_nonce = `<?php echo wp_create_nonce('wp_rest') ?>`;
    window.vz_blog_url = `<?php echo get_bloginfo('url') ?>`;
    window.vz_bell_url = `<?php echo $plugin_dir . '/archive/build/bell.mp3' ?>`;
  </script>
</head>
<body id="root">
  <h1>
    Service Spaces
  </h1>
</body>
<script src="<?php echo $plugin_dir . 'archive/build/static/js/main.js' ?>" defer>
</script>
</html>