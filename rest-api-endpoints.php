<?php 
use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;

add_action('rest_api_init', 'vz_ss_register_rest_routes');
function vz_ss_register_rest_routes() {
 
  register_rest_route('vz-ss/v1', '/update_order_state/', [
    'methods' => 'POST',
    'callback' => 'vz_ss_update_order_state',
    'permission_callback' => 'vz_ss_permission_check',
  ]);
  register_rest_route('vz-ss/v1', '/reset_space/', [
    'methods' => 'POST',
    'callback' => 'vz_ss_reset_space',
    'permission_callback' => 'vz_ss_permission_check',
  ]);
  register_rest_route('vz-ss/v1', '/service_spaces/', [
    'methods' => 'POST',
    'callback' => 'vz_ss_get_service_spaces_endpoint',
    'permission_callback' => 'vz_ss_permission_check',
  ]);
  register_rest_route('vz-ss/v1', '/orders/', [
    'methods' => 'POST',
    'callback' => 'vz_ss_get_orders_endpoint',
    'permission_callback' => 'vz_ss_permission_check',
  ]);
}

function vz_ss_permission_check() {
  // return true;
  return current_user_can('edit_others_posts');
}

function vz_ss_reset_space($request) {
  $args = $request->get_params(); 
  $space_uid = $args['space_uid'];
  $space_id = vz_get_space_by_uid($space_uid);
  delete_post_meta($space_id, 'vz_space_visits');
  $new_uid = strtoupper(wp_generate_password(12, false));
  update_post_meta($space_id, 'vz_service_space_uid', $new_uid);

  return [
    'status' => 'success',
  ];
}

function vz_ss_get_service_spaces_endpoint($request) {
  return [
    'status' => 'success',
    'service_spaces' => vz_ss_get_service_spaces(),
  ];
}

function vz_ss_get_service_spaces() {
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
  return $nss;
}

function vz_ss_get_orders($args) {
  $categories = $args['categories'];
  $tags = $args['tags'];
  $hide_empty = $args['hideEmpty'];
  $orders_per_page = $args['ordersPerPage'];
  $page = $args['currentPage'];
  $status = $args['status'];
  $query = new WC_Order_Query(array(
    'limit' => $orders_per_page,
    'page' => $page,
    'orderby' => 'date',
    'order' => 'ASC',
    'return' => 'ids',
    'status' => $status,
  ));
  $orders = $query->get_orders();

  $formatted_orders = [];
  foreach ($orders as $key => $order_id) {
    $order = wc_get_order($order_id);
    if (!$order || $order->get_type() === 'shop_order_refund') {
      continue;
    }
    $formatted_orders[$key] = [
      'id' => $order_id,
      'number' => $order->get_order_number(),
      'customer' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
      'date' => $order->get_date_created()->date('Y-m-d H:i:s'),
      'total' => $order->get_total(),
      'status' => $order->get_status(),
      'items' => [],
      'notes' => $order->get_customer_note(),
      'location' => vz_ss_order_location($order_id),
    ];
    $items = $order->get_items();
    foreach ($items as $item_id => $item) {
      $product = $item->get_product();
      $product_categories = $product->get_category_ids();
      $product_tags = $product->get_tag_ids();
      $categories_names = [];
      foreach ($product_categories as $j => $tid) {
        $term = get_term($tid);
        $categories_names[] = $term->name;
      }
      $tags_names = [];
      foreach ($product_tags as $f => $tid) {
        $term = get_term($tid);
        $tags_names[] = $term->name;
      }

      if (sizeof($categories) > 0 || sizeof($tags) > 0) {
        if (!sizeof(array_intersect($categories, $product_categories)) && !sizeof(array_intersect($tags, $product_tags))) {
          continue;
        }
      }
      $formatted_orders[$key]['items'][] = [
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'sku' => $product->get_sku(),
        'price' => $product->get_price(),
        'categories' => $categories_names,
        'tags' => $tags_names,
        'quantity' => $item->get_quantity(),
        'total' => $item->get_total(),
      ];
    }
  }

  return [
    'status' => 'success', 
    'orders' => $formatted_orders,
    'product_categories' => vz_ss_get_all_product_categories(),
    'product_tags' => vz_ss_get_all_product_tags(),
    'woo_status' => vz_ss_woo_statuses(),
  ];
}

function vz_ss_woo_statuses() {
  $status = [];
  $statuses = wc_get_order_statuses();
  foreach ($statuses as $key => $value) {
    $status[] = [
      'value' => $key,
      'label' => $value,
    ];
  }
  return $status;
}
 
function vz_ss_get_orders_endpoint($request) {
  $args = $request->get_params();
  return vz_ss_get_orders($args);
}

function vz_ss_get_all_product_categories() {
  $args = array(
    'taxonomy' => 'product_cat',
    'orderby' => 'name',
    'order' => 'ASC',
    'hide_empty' => true,
  );
  $product_categories = get_terms($args);
  $categories = [];
  foreach ($product_categories as $key => $category) {
    $categories[] = [
      'value' => $category->term_id,
      'label' => $category->name,
    ];
  }
  return $categories;
}

function vz_ss_get_all_product_tags() {
  $args = array(
    'taxonomy' => 'product_tag',
    'orderby' => 'name',
    'order' => 'ASC',
    'hide_empty' => true,
  );
  $product_tags = get_terms($args);
  $tags = [];
  foreach ($product_tags as $key => $tag) {
    $tags[] = [
      'value' => $tag->term_id,
      'label' => $tag->name,
    ];
  }
  return $tags;
}

function vz_ss_order_location($order_id) {
  $order_meta = get_post_meta($order_id, 'vz_space_id', true);
  $delivery = false;
  if ($order_meta) {
    // service space
    $location = get_the_title($order_meta);
  } else {
    // delivery address
    $order = wc_get_order($order_id);
    $shipping = $order->get_shipping_address_1();
    $shipping .= $order->get_shipping_address_2() ? ', ' . $order->get_shipping_address_2() : '';
    $shipping .= $order->get_shipping_city() ? ', ' . $order->get_shipping_city() : '';
    $shipping .= $order->get_shipping_state() ? ', ' . $order->get_shipping_state() : '';
    $shipping .= $order->get_shipping_postcode() ? ', ' . $order->get_shipping_postcode() : '';
    $location = $shipping;
    $delivery = true;
  }

  return [
    'delivery' => $delivery,
    'address' => $location,
  ];
}

function vz_ss_update_order_state($request) {
  $args = $request->get_params();
  $order_id = $args['order_id'];
  $status = $args['status'];
  $order = wc_get_order($order_id);
  $order->set_status($status);
  $order->save();
  return [
    'status' => 'success',
  ];
}