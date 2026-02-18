import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import OutCall "http-outcalls/outcall";

import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Product Data Types
  type ProductId = Text;
  type CategoryId = Text;
  type OrderId = Text;
  type ImageId = Text;

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    priceCents : Nat;
    categoryId : CategoryId;
    images : [Storage.ExternalBlob];
    available : Bool;
    featured : Bool;
  };

  public type Category = {
    id : CategoryId;
    name : Text;
  };

  public type OrderStatus = {
    #pending;
    #completed;
    #shipped;
    #cancelled;
  };

  public type OrderItem = {
    productId : ProductId;
    quantity : Nat;
    priceCents : Nat;
  };

  public type Order = {
    id : OrderId;
    customerId : Principal;
    customerName : Text;
    customerEmail : Text;
    shippingAddress : Text;
    items : [OrderItem];
    totalAmountCents : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  // Storage Maps
  let products = Map.empty<ProductId, Product>();
  let categories = Map.empty<CategoryId, Category>();
  let orders = Map.empty<OrderId, Order>();

  // Authorization State
  let accessControlState = AccessControl.initState();

  // Stripe Configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Categories Management
  public shared ({ caller }) func addCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    categories.add(category.id, category);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  // Product Management
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(categoryId : CategoryId) : async [Product] {
    let iter = products.values().filter(
      func(p) {
        p.categoryId == categoryId;
      }
    );
    iter.toArray();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    let iter = products.values().filter(
      func(p) {
        p.featured;
      }
    );
    iter.toArray();
  };

  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    let lowerSearch = searchTerm.toLower();
    let iter = products.values().filter(
      func(p) {
        p.name.toLower().contains(#text lowerSearch) or
        p.description.toLower().contains(#text lowerSearch);
      }
    );
    iter.toArray();
  };

  // Product Comparison by Price
  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.priceCents, p2.priceCents);
    };
  };

  public query ({ caller }) func getProductsSortedByPrice(ascending : Bool) : async [Product] {
    let productArray = products.values().toArray();
    if (productArray.size() <= 1) {
      return productArray;
    };

    let sorted =
      if (ascending) {
        productArray.sort();
      } else {
        productArray.sort().reverse();
      };
    sorted;
  };

  // Image Handling
  public shared ({ caller }) func uploadProductImage(blob : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload images");
    };
    blob;
  };

  public shared ({ caller }) func addProductImage(productId : ProductId, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add product images");
    };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    let newImages = List.fromArray(product.images);
    newImages.add(image);
    let updatedProduct = {
      product with
      images = newImages.toArray();
    };
    products.add(productId, updatedProduct);
  };

  public shared ({ caller }) func removeProductImage(productId : ProductId, imageId : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove product images");
    };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    let filteredImages = product.images.filter(
      func(img) { not (img == imageId) }
    );
    let updatedProduct = {
      product with
      images = filteredImages;
    };
    products.add(productId, updatedProduct);
  };

  // Stripe Payment Handling
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getValidStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func createCheckoutSession(
    items : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getValidStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };
    await Stripe.getSessionStatus(getValidStripeConfig(), sessionId, transform);
  };

  // Order Management
  public shared ({ caller }) func createOrder(
    customerName : Text,
    customerEmail : Text,
    shippingAddress : Text,
    items : [OrderItem],
    totalAmountCents : Nat
  ) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };
    let orderId = Time.now().toText();
    let order : Order = {
      id = orderId;
      customerId = caller;
      customerName;
      customerEmail;
      shippingAddress;
      items;
      totalAmountCents;
      status = #pending;
      createdAt = Time.now();
    };
    orders.add(orderId, order);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
    let updatedOrder = {
      existingOrder with
      status;
    };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
    // Users can only view their own orders, admins can view all
    if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    order;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter orders by status");
    };
    let iter = orders.values().filter(
      func(order) {
        order.status == status;
      }
    );
    iter.toArray();
  };

  public query ({ caller }) func getCallerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    let iter = orders.values().filter(
      func(order) {
        order.customerId == caller;
      }
    );
    iter.toArray();
  };

  // Authorization Management (required for access control)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Transform function for HTTP outcalls from Stripe component
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
