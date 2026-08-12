# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
# Frontier Enterprise — Operating Layer

Enterprise operating layer for the Frontier AI Platform. Provides SSO/SAML/OIDC authentication, Role-Based Access Control (RBAC), Multi-tenancy, Compliance auditing, Monitoring, and Kubernetes-native deployment.

## Modules

| Module          | Description |
|-----------------|-------------|
| **SSO**         | Multi-provider SSO supporting SAML, OIDC, LDAP, Google, Microsoft, GitHub |
| **RBAC**        | Role-based access control with fine-grained actions (CRUD + Admin) and workspace scoping |
| **Multi-tenancy** | Tenant management with plan-based member limits (CORE=5, STUDIO=50, ENTERPRISE=unlimited) |
| **Compliance**  | Compliance rule engine for GDPR, SOC2, HIPAA, ISO27001; audit event logging; data retention policies |
| **Monitoring**  | Health checks, metric recording, alert management, and dashboard summary |

## API Endpoints

### Auth (`/api/v1/enterprise/auth`)
- `POST /providers` — Register SSO provider
- `GET /providers` — List providers
- `GET /providers/{id}` — Get provider
- `POST /providers/{id}/toggle` — Enable/disable
- `POST /providers/{id}/authenticate` — Authenticate
- `POST /roles` — Create custom role
- `GET /roles` — List roles
- `POST /roles/assign` — Assign role to user
- `POST /roles/check` — Check permission
- `GET /users/{id}/permissions` — Get user permissions

### Workspaces (`/api/v1/enterprise/workspaces`)
- `POST /tenants` — Create tenant
- `GET /tenants` — List tenants
- `GET /tenants/{id}` — Get tenant
- `POST /tenants/{id}/deactivate` — Deactivate
- `POST /tenants/{id}/members` — Add member
- `DELETE /tenants/{id}/members/{uid}` — Remove member
- `GET /tenants/{id}/members` — List members
- `PUT /tenants/{id}/plan` — Change plan

### Compliance (`/api/v1/enterprise/compliance`)
- `GET /rules` — List compliance rules
- `POST /rules/{id}/toggle` — Toggle rule
- `GET /events` — List audit events
- `POST /events` — Log event
- `GET /events/export` — Export events
- `POST /retention-policies` — Create policy
- `GET /retention-policies` — List policies
- `POST /retention/check` — Run retention check
- `GET /report/{standard}` — Compliance report

### Monitoring (`/api/v1/enterprise/monitoring`)
- `GET /health` — Check all components
- `GET /health/{component}` — Check specific component
- `GET /metrics` — List metric names
- `GET /metrics/{name}` — Get metric values
- `POST /metrics` — Record metric
- `GET /alerts` — List alerts
- `POST /alerts` — Create alert
- `POST /alerts/{id}/acknowledge` — Acknowledge
- `POST /alerts/{id}/resolve` — Resolve
- `GET /dashboard` — Dashboard summary

## Kubernetes Deployment

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

## Development

```bash
pip install -e .
uvicorn src.main:app --reload --port 8000
```

## Running Tests

```bash
pytest tests/ -v
```
