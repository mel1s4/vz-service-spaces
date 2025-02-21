<?php
/*
Plugin Name: Viroz Service Spaces
Plugin URI: https://viroz.studio/project/
Description: Creates a custom post type for service spaces where clients can log in and make orders from.
Version: 0.1.0
Author: Melisa Viroz
Author URI: http://melisaviroz.com
License: GPL2
*/
use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;

// allow cross origin
add_action('init', 'vz_service_spaces_allow_cors');
function vz_service_spaces_allow_cors() {
  header("Access-Control-Allow-Origin: *");
}

// requires woocommerce, send an alert if it's not installed
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
  add_action('admin_notices', 'vz_service_spaces_alert');
  function vz_service_spaces_alert() {
    echo '<div class="notice notice-error is-dismissible">
      <p>WooCommerce is required for the Viroz Service Spaces plugin to work. Please install and activate WooCommerce.</p>
    </div>';
  }
  return;
}

if (!defined('ABSPATH')) {
  exit;
}

function vz_service_spaces_init() {
  include 'init.php';
}
add_action('init', 'vz_service_spaces_init');

include 'rest-api-endpoints.php';

add_action('add_meta_boxes', 'vz_service_spaces_custom_fields');
function vz_service_spaces_custom_fields() {
  add_meta_box(
    'vz_service_spaces_meta_box',
    'Service Space Details', 
    'vz_service_spaces_meta_box_callback',
    'vz-service-space',
    'normal', 
    'high' 
  );
}

// Add a custom metabox
add_action( 'add_meta_boxes', 'admin_order_custom_metabox' );
function admin_order_custom_metabox() {
    $screen = class_exists( '\Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController' ) && wc_get_container()->get( CustomOrdersTableController::class )->custom_orders_table_usage_is_enabled()
        ? wc_get_page_screen_id( 'shop-order' )
        : 'shop_order';

    add_meta_box(
        'vz_order_space_details',
        'Ordenado Desde',
        'vz_space_details_callback',
        $screen,
        'side',
        'high'
    );
}

function vz_space_details_callback($post) {
  $post_id = $post->get_id();
  $space_id = get_post_meta($post_id, 'vz_space_id', true);
  if (!$space_id) {
    echo '<h1>No space details found.</h1>';
    return;
  }
  $space = get_post($space_id);
  $space_uid = get_post_meta($space_id, 'vz_service_space_uid', true);
  $space_uid_readable = implode('-', str_split($space_uid, 4));
  $space_login_url = get_site_url() . '/?vz_space_uid=' . $space_uid;
  echo "<h1><a href='" . get_edit_post_link($space_id) . "'>" . get_the_title($space_id) . "</a></h1>";
}

function vz_service_spaces_meta_box_callback($post) {
  include 'service-space-meta-box.php';
}

function vz_service_spaces_save_meta_box_data($post_id) {
  if (!isset($_POST['vz_service_spaces_meta_box_nonce'])) {
    return;
  }

  if (!wp_verify_nonce($_POST['vz_service_spaces_meta_box_nonce'], 'vz_service_spaces_save_meta_box_data')) {
    return;
  }

  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
    return;
  }

  if (!current_user_can('edit_post', $post_id)) {
    return;
  }

  if (isset($_POST['vz_service_spaces_refresh_code']) == "refresh_code") {
    $space_uid = strtoupper(wp_generate_password(12, false));
    update_post_meta($post_id, 'vz_service_space_uid', $space_uid);
    // reset visitors list
    delete_post_meta($post_id, 'vz_space_visits');
  }
}

add_action('save_post', 'vz_service_spaces_save_meta_box_data');

function vz_service_spaces_admin_styles() {
  wp_enqueue_style('vz_service_spaces_admin_css', plugin_dir_url(__FILE__) . 'admin-styles.css');
}
add_action('admin_enqueue_scripts', 'vz_service_spaces_admin_styles');

function vz_service_spaces_styles() {
  wp_enqueue_script('vz_service_spaces_js', plugin_dir_url(__FILE__) . 'functions.js', ['jquery'], null, true);
  wp_enqueue_style('vz_service_spaces_css', plugin_dir_url(__FILE__) . 'styles.css');
}
add_action('wp_enqueue_scripts', 'vz_service_spaces_styles');

function vz_services_add_cookie() {
  if (is_admin()) return;
  if (!isset($_GET['vz_space_uid'])) {
    return;
  }
  $space_uid = $_GET['vz_space_uid'];
  $space = get_posts([
    'post_type' => 'vz-service-space',
    'posts_per_page' => 1,
    'post_status' => 'publish',
    'fields' => 'ids',
    'meta_query' => [
      [
        'key' => 'vz_service_space_uid',
        'value' => $space_uid
      ]
    ]
  ]);
  if (!$space) {
    setcookie('vz_space_uid', '', -1, '/');
    setcookie('vz_space_user_id', '', -1, '/');
    return;
  }
  if (isset($_COOKIE['vz_space_uid'])) {
    return;
  }
  $cookie_ttl = time() + 3600 * 6;
  setcookie('vz_space_uid', $space_uid, $cookie_ttl , '/');
  $user_id = get_current_user_id();
  if ($user_id) {
    setcookie('vz_space_user_id', $user_id, $cookie_ttl, '/');
  } else {
    $user_id = "anon_" . wp_generate_password(6, false);
    setcookie('vz_space_user_id', $user_id, $cookie_ttl, '/');
  }
  
  if ($space) {
    $visit_details = [
      'visitor' => $user_id,
      'time' => time(),
    ];
    add_post_meta($space[0], 'vz_space_visits', $visit_details);
  }
}

add_action('wp', 'vz_services_add_cookie');

function vz_service_spaces_footer_content() {
  include 'footer-content.php';
}

add_action('wp_footer', 'vz_service_spaces_footer_content');

function vz_get_space_by_uid($uid) {
  $posts = get_posts([
    'post_type' => 'vz-service-space',
    'posts_per_page' => 1,
    'post_status' => 'publish',
    'fields' => 'ids',
    'meta_query' => [
      [
        'key' => 'vz_service_space_uid',
        'value' => $uid
      ]
    ]
  ]);
  if (!$posts) {
    return false;
  }
  return $posts[0];
}

// add custom field to checkout
add_action('woocommerce_thankyou', 'vz_add_space_id_to_order', 10, 4);
function vz_add_space_id_to_order($order_id) {
  if (!isset($_COOKIE['vz_space_uid'])) {
    update_post_meta($order_id, 'vz_space_id', 'no_space', true);
    return;
  }
  $space_uid = $_COOKIE['vz_space_uid'];
  $space_id = vz_get_space_by_uid($space_uid);
  if (!$space_id) return;
  if (get_post_meta($order_id, 'vz_space_id', true)) return;
  update_post_meta($order_id, 'vz_space_id', $space_id, true);
  update_post_meta($order_id, 'vz_space_uid', $space_uid, true);  
}


function vz_ss_get_unique_visits($space_id) {
  $visits = get_post_meta($space_id, 'vz_space_visits');
  $visits = array_reverse($visits);
  $unique_visitors = [];
  foreach ($visits as $visit) {
    if (!in_array($visit['visitor'], $unique_visitors))
      $unique_visitors[$visit['visitor']] = $visit;
  }
  $nVisits = [];
  foreach ($unique_visitors as $visit) {
    $nVisits[] = $visit;
  }
  return $nVisits;
}

function vz_get_orders_from_uid($space_uid) {
  global $wpdb;


  // High-Performance Order Storage (HPOS) table names
  $orders_table         = $wpdb->prefix . 'wc_orders';
  $postmeta_table       = $wpdb->prefix . 'postmeta';

  // SQL query to get order IDs by vz_space_uid
  $order_ids = $wpdb->get_col($wpdb->prepare("
    SELECT DISTINCT o.ID
    FROM {$orders_table} AS o
    INNER JOIN {$postmeta_table} AS pm ON o.ID = pm.post_id
    WHERE pm.meta_key = 'vz_space_uid'
    AND pm.meta_value = %s
  ", $space_uid));

  return $order_ids;
}

add_filter('template_include', 'vz_service_space_template_override');
function vz_service_space_template_override($template) {
  if (is_singular('vz-service-space')) {
    return plugin_dir_path(__FILE__) . 'single-vz-service-space.php';
  }
  if (is_post_type_archive('vz-service-space')) {
    // if user is admin
    if (current_user_can('edit_posts')) {
      return plugin_dir_path(__FILE__) . 'archive-vz-service-space.php';
    } else {
      wp_redirect(home_url());
    }
  }
  return $template;
}

function vz_service_space_details($space_uid, $space_id = null) {
  if (!$space_id) {
    $space_id = vz_get_space_by_uid($space_uid);
  }
  if (!$space_id) {
    return new WP_Error('no_space', 'No space found with that UID', ['status' => 404]);
  }
  $visits = vz_ss_get_unique_visits($space_id);
  $orders = vz_get_orders_from_uid($space_uid);
  $nVisits = [];
  foreach ($visits as $visit) {
    $nVisits[] = [
      'visitor' => vz_get_visitor_from_uuid($visit['visitor']),
      'time' => intval($visit['time']),
    ];
  }
  $nOrders = [];
  $pending_payment = 0;
  foreach ($orders as $order_id) {
    $order = wc_get_order($order_id);
    $user_id = $order->get_user_id();
    $user_data = get_userdata($user_id);
    if ($user_data) {
      $user_login = $user_data->user_login;
    } else {
      $user_login = 'anon_' . $user_id;
    }
    $items = [];
    foreach ($order->get_items() as $item_id => $item) {
      $items[] = [
        'product_id' => $item->get_product_id(),
        'item_id' => $item_id,
        'quantity' => $item->get_quantity(),
        'product_permalink' => get_permalink($item->get_product_id()),
        'product_name' => $item->get_name(),
        'product_price' => $item->get_total(),
        'quantity' => $item->get_quantity(),
      ];
    }
    $nOrders[] = [
      'order_id' => $order_id,
      'user_id' => $user_id,
      'user_login' => $user_login,
      'order_total' => $order->get_total(),
      'order_status' => $order->get_status(),
      'order_date' => $order->get_date_created()->date('Y-m-d H:i:s'),
      'billing_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
      'items' => $items,
      'delivered_products' => get_post_meta($order_id, 'vz_order_delivered_products', true),
      'ready_products' => get_post_meta($order_id, 'vz_order_ready_products', true),
    ];
    if ($order->get_status() !== 'completed') {
      $pending_payment += intval($order->get_total());
    }
  }
  return [
    'space_title' => get_the_title($space_id),
    'visits' => $nVisits,
    'orders' => $nOrders,
    'pending_payment' => $pending_payment,
  ];
}

function vz_get_visitor_from_uuid($uuid) {
  if (strpos($uuid, 'anon_') !== false) {
    return $uuid;
  }
  return get_userdata(intval($uuid))->user_login;
}

add_action('admin_menu', 'vz_service_spaces_admin_menu');
function vz_service_spaces_admin_menu() {
  $url = get_bloginfo('url') . '/service-space/';
  add_submenu_page(
    'edit.php?post_type=vz-service-space',
    'Service Spaces',
    'Service Spaces',
    'edit_posts',
    $url,
  );
}

// Create a shortcode to display service space details
function vz_service_space_orders_shortcode($atts) {
  include 'vz-ss-orders.php';
  die();
  return;
}
add_shortcode('vz-ss-orders', 'vz_service_space_orders_shortcode');

add_shortcode('vz-ss-log-into-space', 'vz_service_space_log_into_space_shortcode');
function vz_service_space_log_into_space_shortcode($atts) {
  ob_start();
  include 'log-into-space.php';
  return ob_get_clean();
}