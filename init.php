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
  'public'             => true,
  'publicly_queryable' => true,
  'show_ui'            => true,
  'show_in_menu'       => true,
  'query_var'          => true,
  'rewrite'            => array('slug' => 'service-space'),
  'capability_type'    => 'post',
  'has_archive'        => true,
  'hierarchical'       => false,
  'menu_position'      => null,
  'supports'           => array('title', 'editor'),
  'menu_icon'          => 'dashicons-flag',
  'show_in_rest'       => false,
  'taxonomies'         => array('vz-ss-category')
);

register_post_type('vz-service-space', $args);

$taxonomy_labels = array(
  'name'              => _x('Categories', 'taxonomy general name', 'vz-service-spaces'),
  'singular_name'     => _x('Category', 'taxonomy singular name', 'vz-service-spaces'),
  'search_items'      => __('Search Categories', 'vz-service-spaces'),
  'all_items'         => __('All Categories', 'vz-service-spaces'),
  'parent_item'       => __('Parent Category', 'vz-service-spaces'),
  'parent_item_colon' => __('Parent Category:', 'vz-service-spaces'),
  'edit_item'         => __('Edit Category', 'vz-service-spaces'),
  'update_item'       => __('Update Category', 'vz-service-spaces'),
  'add_new_item'      => __('Add New Category', 'vz-service-spaces'),
  'new_item_name'     => __('New Category Name', 'vz-service-spaces'),
  'menu_name'         => __('Categories', 'vz-service-spaces'),
);

$taxonomy_args = array(
  'hierarchical'      => true,
  'labels'            => $taxonomy_labels,
  'show_ui'           => true,
  'show_admin_column' => true,
  'query_var'         => true,
  'rewrite'           => array('slug' => 'vz-ss-category'),
);

register_taxonomy('vz-ss-category', array('vz-service-space'), $taxonomy_args);