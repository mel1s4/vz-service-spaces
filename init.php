<?php 

$labels = array(
  'name'               => _x('Service Spaces', 'post type general name', 'vz-service-spaces'),
  'singular_name'      => _x('Service Space', 'post type singular name', 'vz-service-spaces'),
  'menu_name'          => _x('Service Spaces', 'admin menu', 'vz-service-spaces'),
  'name_admin_bar'     => _x('Service Space', 'add new on admin bar', 'vz-service-spaces'),
  'add_new'            => _x('Add New', 'service space', 'vz-service-spaces'),
  'add_new_item'       => __('Add New Service Space', 'vz-service-spaces'),
  'new_item'           => __('New Service Space', 'vz-service-spaces'),
  'edit_item'          => __('Edit Service Space', 'vz-service-spaces'),
  'view_item'          => __('View Service Space', 'vz-service-spaces'),
  'all_items'          => __('All Service Spaces', 'vz-service-spaces'),
  'search_items'       => __('Search Service Spaces', 'vz-service-spaces'),
  'parent_item_colon'  => __('Parent Service Spaces:', 'vz-service-spaces'),
  'not_found'          => __('No service spaces found.', 'vz-service-spaces'),
  'not_found_in_trash' => __('No service spaces found in Trash.', 'vz-service-spaces')
);

$args = array(
  'labels'             => $labels,
  'public'             => false,
  'publicly_queryable' => false,
  'show_ui'            => true,
  'show_in_menu'       => true,
  'query_var'          => true,
  'rewrite'            => array('slug' => 'service-space'),
  'capability_type'    => 'post',
  'has_archive'        => false,
  'hierarchical'       => false,
  'menu_position'      => null,
  'supports'           => array('title', 'editor'),
  'menu_icon'          => 'dashicons-flag',
);

register_post_type('vz-service-space', $args);