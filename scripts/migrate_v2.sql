-- v2: Add unique constraints for cart and wishlist ON CONFLICT support

ALTER TABLE cart
  ADD CONSTRAINT cart_user_listing_unique UNIQUE (user_id, listing_id);

ALTER TABLE wishlist
  ADD CONSTRAINT wishlist_user_listing_unique UNIQUE (user_id, listing_id);
