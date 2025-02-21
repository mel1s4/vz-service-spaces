
<?php
  $uid = $_GET['vz_space_uid'] ?? '';
  $format_uid = implode('-', str_split($uid, 4));
  $space_id = vz_get_space_by_uid($uid);
  $error = false;
  if ($uid !== '' && !$space_id) {
    $error = "No se encontro la mesa";
  }
?>
<div class="LogIntoSpace">
  <h2 class="vz-ss__login-space__title">
    Acceder a una Mesa
  </h2>
  <form method="get" action="">
    <input type="text"
          name='vz_space_uid'
          id='vz_ss_space_uid_input'
          placeholder='ASD2-3D4F-5G6H'
          value="<?php echo $uid ?>" />
    <label>
      Codigo de la Mesa
    </label>
    <p id="vz_ss_uid">
      <?php echo $format_uid ?>
    </p>
    <?php if($error) : ?>
    <span class="error">
      <?php echo $error ?>
    </span>
    <?php endif; ?>
    <button type="submit" >
      Acceder
    </button>
  </form>
</div>