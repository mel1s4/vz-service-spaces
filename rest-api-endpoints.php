<?php 
add_action('rest_api_init', 'vz_ss_register_rest_routes');
function vz_ss_register_rest_routes() {
  register_rest_route('vz-ss/v1', '/delivered/', [
    'methods' => 'POST',
    'callback' => 'vz_mark_product_as_delivered',
    'permission_callback' => function () {
      return current_user_can('edit_posts');
    },
  ]);
  register_rest_route('vz-ss/v1', '/reset_space/', [
    'methods' => 'POST',
    'callback' => 'vz_ss_reset_space',
    'permission_callback' => function () {
      return current_user_can('edit_posts');
    },
  ]);
  register_rest_route('vz-ss/v1', '/service_spaces/', [
    'methods' => 'POST',
    'callback' => 'vz_ss_get_service_spaces',
    'permission_callback' => function () {
      return true;
      return current_user_can('edit_posts');
    },
  ]);
}

function vz_ss_test($request) {
  return [
    'status' => 'success',
    'message' => 'Hello World'
  ];
}

function vz_mark_product_as_delivered($request) {
  $args = $request->get_params();
  $order_id = $args['order_id'];
  $item_index = $args['item_index'];
  $space_uid = $args['space_uid'];
  $space_id = vz_get_space_by_uid($space_uid);

  $space_delivered_products = get_post_meta($space_id, 'vz_space_delivered_products', true);
  if (!$space_delivered_products) {
    $space_delivered_products = [];
  }
  if ($space_delivered_products[$order_id][$item_index]) {
    unset($space_delivered_products[$order_id][$item_index]);
  } else {
    $space_delivered_products[$order_id][$item_index] = time();
  }
  update_post_meta($space_id, 'vz_space_delivered_products', $space_delivered_products);
  return [
    'status' => 'success',
    'delivered_products' => $space_delivered_products
  ];
}

function vz_ss_reset_space($request) {

  $args = $request->get_params();
  $space_uid = $args['space_uid'];
  $space_id = vz_get_space_by_uid($space_uid);
  delete_post_meta($space_id, 'vz_space_visits');
  delete_post_meta($space_id, 'vz_space_delivered_products');
  $new_uid = strtoupper(wp_generate_password(12, false));
  update_post_meta($space_id, 'vz_service_space_uid', $new_uid);

  return [
    'status' => 'success',
  ];
}

function vz_ss_get_service_spaces($request) {
  $args = $request->get_params();

  $service_spaces = get_posts([
    'post_type' => 'vz-service-space',
    'posts_per_page' => -1,
    'orderby' => 'title',
    'order' => 'ASC',
    'fields' => 'ids'
  ]);
  $nss = [];
  foreach ($service_spaces as $key => $space) {
    $uid = get_post_meta($space, 'vz_service_space_uid', true);
    $nss[$key] = vz_service_space_details($uid);
    $nss[$key]['id'] = $space;
    $nss[$key]['uid'] = $uid;
    $nss[$key]['url'] = get_the_permalink($space);
  }

  return [
    'status' => 'success',
    'service_spaces' => $nss
  ];
}
 