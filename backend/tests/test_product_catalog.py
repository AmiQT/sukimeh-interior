"""Unit tests for the product catalog service."""

from services.product_catalog import (
    load_products,
    get_products_by_room,
    get_product_by_id,
    get_products_by_role,
)


class TestLoadProducts:
    """Validate product loading from JSON."""

    def test_load_products(self):
        products = load_products()
        assert len(products) == 13

    def test_products_have_required_fields(self):
        products = load_products()
        for p in products:
            assert p.id, "Product must have an id"
            assert p.name, "Product must have a name"
            assert p.price > 0, "Product price must be positive"
            assert p.original_price >= p.price, "Original price >= discounted price"
            assert p.room, "Product must have a room"
            assert p.placement_role, "Product must have a placement_role"
            assert p.thumbnail, "Product must have a thumbnail"


class TestFilterProducts:
    """Validate product filtering by room, id, and role."""

    def test_get_products_by_room_kitchen(self):
        kitchen = get_products_by_room("kitchen")
        assert len(kitchen) == 4
        assert all(p.room == "kitchen" for p in kitchen)

    def test_get_product_by_id_found(self):
        product = get_product_by_id("ELB-HOOD-X5")
        assert product is not None
        assert product.name == "Elba Smart Hood X5"
        assert product.price == 1299

    def test_get_product_by_id_not_found(self):
        product = get_product_by_id("INVALID-999")
        assert product is None
