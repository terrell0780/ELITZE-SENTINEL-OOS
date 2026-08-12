# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core.sso import SSOProvider, SSOType


@pytest.fixture
def sso():
    return SSOProvider()


class TestSSOProvider:
    def test_register_provider(self, sso):
        provider = sso.register_provider("Google Auth", SSOType.GOOGLE, "https://accounts.google.com", "client-123")
        assert provider.name == "Google Auth"
        assert provider.type == SSOType.GOOGLE
        assert provider.enabled is True
        assert provider.provider_id.startswith("sso-")

    def test_list_providers(self, sso):
        sso.register_provider("GitHub", SSOType.GITHUB, "https://github.com", "gh-1")
        sso.register_provider("Azure AD", SSOType.MICROSOFT, "https://login.microsoftonline.com", "ms-1")
        providers = sso.list_providers()
        assert len(providers) == 2

    def test_get_provider(self, sso):
        p = sso.register_provider("SAML 1", SSOType.SAML, "https://saml.example.com", "saml-1")
        found = sso.get_provider(p.provider_id)
        assert found is not None
        assert found.name == "SAML 1"

    def test_get_provider_not_found(self, sso):
        assert sso.get_provider("sso-nonexistent") is None

    def test_toggle_provider(self, sso):
        p = sso.register_provider("LDAP", SSOType.LDAP, "ldap://example.com", "ldap-1")
        assert p.enabled is True
        toggled = sso.toggle_provider(p.provider_id)
        assert toggled.enabled is False
        toggled_again = sso.toggle_provider(p.provider_id)
        assert toggled_again.enabled is True

    def test_authenticate_success(self, sso):
        p = sso.register_provider("OIDC", SSOType.OIDC, "https://oidc.example.com", "oidc-1")
        identity = sso.authenticate(p.provider_id, {"email": "user@example.com", "name": "Test User"})
        assert identity is not None
        assert identity.email == "user@example.com"
        assert identity.name == "Test User"
        assert "user" in identity.roles

    def test_authenticate_provider_disabled(self, sso):
        p = sso.register_provider("Disabled Provider", SSOType.OIDC, "https://example.com", "c1")
        sso.toggle_provider(p.provider_id)
        identity = sso.authenticate(p.provider_id, {"email": "user@example.com"})
        assert identity is None

    def test_authenticate_no_email(self, sso):
        p = sso.register_provider("No Email", SSOType.OIDC, "https://example.com", "c2")
        identity = sso.authenticate(p.provider_id, {})
        assert identity is None

    def test_unlink_identity(self, sso):
        p = sso.register_provider("Test", SSOType.GITHUB, "https://github.com", "gh")
        identity = sso.authenticate(p.provider_id, {"email": "test@test.com"})
        assert sso.get_identity(identity.identity_id) is not None
        assert sso.unlink_identity(identity.identity_id) is True
        assert sso.get_identity(identity.identity_id) is None
