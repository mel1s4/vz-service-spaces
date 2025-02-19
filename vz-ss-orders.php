<?php
  $plugin_dir = plugin_dir_url(__FILE__);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>
    <?php echo get_the_title() ?>
  </title>
  <link rel="stylesheet" href="<?php echo $plugin_dir .  'orders/build/static/css/main.css' ?>">
  <script>
    window.vz_ss_nonce = `<?php echo wp_create_nonce('wp_rest') ?>`;
    window.vz_ss_blog_url = `<?php echo get_bloginfo('url') ?>`;
  </script>
</head>
<body id="root">
  <h1>
    Loading...
  </h1>
</body>
  <script src="<?php echo $plugin_dir . 'orders/build/static/js/main.js' ?>" defer>
  </script>
</html>