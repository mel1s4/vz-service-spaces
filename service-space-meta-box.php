<?php 
wp_nonce_field('vz_service_spaces_save_meta_box_data', 'vz_service_spaces_meta_box_nonce');
$visits = vz_ss_get_unique_visits($post->ID, 'vz_space_visits');
$saved_space_uid = get_post_meta($post->ID, 'vz_service_space_uid', true);
if ($saved_space_uid) {
  $space_uid = $saved_space_uid;
} else {
  $space_uid = strtoupper(wp_generate_password(12, false));
  update_post_meta($post->ID, 'vz_service_space_uid', $space_uid);
}

$space_uid_readable = implode('-', str_split($space_uid, 4));
$space_login_url = get_site_url() . '/?vz_space_uid=' . $space_uid;

$qr_code_api = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";
$args = array(
  'size' => '150x150',
  'data' => $space_login_url
);
$qrcode = add_query_arg($args, $qr_code_api);


?>
<img src="<?php echo $qrcode ?>" alt="QR Code" />
<p>
  <strong>Space URL:</strong> <?php echo $space_login_url; ?>
  <a href="<?php echo $space_login_url; ?>" target="_blank">Visit Space</a>
</p>
<p>
  <strong>Space UID:</strong> <?php echo $space_uid_readable; ?>
</p>

<section class="vz_space-visits">
  <ol>
    <?php if ($visits) : ?>
      <?php 
        foreach ($visits as $visit) : 
          $readable_time = date('Y-m-d H:i:s', intval($visit['time']));
          if (str_contains($visit['visitor'], 'anon_')) {
            $visitor = 'Anonymous';
          } else {
            $visitor = get_userdata($visit['visitor'])->user_login;
          }
      ?>
        <li>
          <strong>Visitor:</strong> <?php echo $visitor; ?>
          <strong>Time:</strong> <?php echo $readable_time; ?>
        </li>
      <?php endforeach; ?>
    <?php else : ?>
      <li>No visits yet.</li>
    <?php endif; ?>
  </ol>
</section>

<section class="vz_space-orders">
  <?php
    $orders = vz_get_orders_from_uid($space_uid);
    if ($orders) :
  ?>
    <ul>
  <?php 
    foreach ($orders as $order_id) :
      $order = wc_get_order($order_id);
      $user_id = $order->get_user_id();
      $user_login = get_userdata($user_id)->user_login;
      $items = $order->get_items();
  ?>
    <li>
      <p class="user">
        <?php echo $user_login; ?>
      </p>
      <p class="billing_name">
        <?php echo $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(); ?>
      </p>
      <p class="total">
        <?php echo $order->get_total(); ?>
      </p>
      <a href="<?php the_permalink($order); ?>">
        Ver Orden
      </a>
    </li>
  <?php endforeach; ?>
    </ul>
  <?php else : ?>
    <p>No orders yet.</p>
  <?php endif; ?>


</section>

<button type="submit" 
        name="vz_service_spaces_refresh_code"
        value="refresh_code"
        class="button button-primary">
  Refresh Code
</button>

<?php
echo "";