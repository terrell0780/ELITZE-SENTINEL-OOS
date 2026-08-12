# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class SSOType(str, Enum):
    SAML = "saml"
    OIDC = "oidc"
    LDAP = "ldap"
    GOOGLE = "google"
    MICROSOFT = "microsoft"
    GITHUB = "github"


@dataclass
class IdentityProvider:
    provider_id: str
    name: str
    type: SSOType
    issuer_url: str
    client_id: str
    client_secret: str
    enabled: bool
    metadata: dict


@dataclass
class UserIdentity:
    identity_id: str
    provider_id: str
    external_user_id: str
    email: str
    name: str
    roles: list
    linked_at: str


class SSOProvider:
    def __init__(self):
        self._providers: dict[str, IdentityProvider] = {}
        self._identities: dict[str, UserIdentity] = {}

    def register_provider(
        self,
        name: str,
        type: SSOType,
        issuer_url: str,
        client_id: str,
        metadata: Optional[dict] = None,
    ) -> IdentityProvider:
        provider_id = f"sso-{uuid.uuid4().hex[:12]}"
        provider = IdentityProvider(
            provider_id=provider_id,
            name=name,
            type=type,
            issuer_url=issuer_url,
            client_id=client_id,
            client_secret="",
            enabled=True,
            metadata=metadata or {},
        )
        self._providers[provider_id] = provider
        return provider

    def list_providers(self) -> list[IdentityProvider]:
        return list(self._providers.values())

    def get_provider(self, provider_id: str) -> Optional[IdentityProvider]:
        return self._providers.get(provider_id)

    def toggle_provider(self, provider_id: str) -> Optional[IdentityProvider]:
        provider = self._providers.get(provider_id)
        if provider is None:
            return None
        provider.enabled = not provider.enabled
        return provider

    def authenticate(
        self, provider_id: str, credentials: dict
    ) -> Optional[UserIdentity]:
        provider = self._providers.get(provider_id)
        if provider is None or not provider.enabled:
            return None
        email = credentials.get("email")
        if not email:
            return None
        identity_id = f"uid-{uuid.uuid4().hex[:12]}"
        identity = UserIdentity(
            identity_id=identity_id,
            provider_id=provider_id,
            external_user_id=f"ext-{uuid.uuid4().hex[:8]}",
            email=email,
            name=credentials.get("name", email.split("@")[0]),
            roles=["user"],
            linked_at=datetime.now(timezone.utc).isoformat(),
        )
        self._identities[identity_id] = identity
        return identity

    def get_identity(self, identity_id: str) -> Optional[UserIdentity]:
        return self._identities.get(identity_id)

    def unlink_identity(self, identity_id: str) -> bool:
        identity = self._identities.pop(identity_id, None)
        return identity is not None
