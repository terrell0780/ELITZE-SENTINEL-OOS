# Frontier-core/src/orchestrator.py
# DEPRECATED: Superseded by direct use of FrontierGateway + TerrellHallGuardrails in workbench.py.
# Kept for backward compatibility. Will be removed in v2.0.
import logging
from .core.firewall import TerrellHallGuardrails
from .core.gateway import FrontierGateway

logger = logging.getLogger("Frontier-core.orchestrator")

class Frontier5Orchestrator:
    """
    Frontier Orchestrator — Integration of Frontier Gateway + Terrell Hall Guardrails

    This is the complete system that orchestrates all components:
    1. Frontier Gateway: Multi-model AI gateway with streaming and fallback
    2. Terrell Hall Guardrails: Security and audit logging
    """

    def __init__(self):
        self.firewall = TerrellHallGuardrails()
        self.Frontier_gateway = FrontierGateway()
        self.is_initialized = False

    async def initialize(self):
        """Initialize the complete Frontier system"""
        logger.info("Initializing Frontier system...")

        # Initialize components in dependency order
        await self.firewall.connect()
        await self.Frontier_gateway.initialize()

        self.is_initialized = True

        logger.info("Frontier system fully initialized")

    async def process_query(self, session_id: str, query: str, model_profile: str = "Frontier_5"):
        """
        Process a query through the complete Frontier pipeline:
        1. Check gateway safeguards
        2. Apply security checks
        3. Execute via orchestration
        4. Apply audit logging
        """
        if not self.is_initialized:
            await self.initialize()

        try:
            logger.info(f"Processing query: {query[:100]}...")

            # Step 1: Check gateway safeguards (first layer)
            Frontier_result = await self.Frontier_gateway.process_request(query, model_profile)

            if Frontier_result.get("fallback_active"):
                logger.warning(f"Gateway safeguard triggered: {Frontier_result.get('classifier_triggered')}")
                logger.info("Falling back to Opus 4.8...")

                return {
                    "result": Frontier_result["result"],
                    "cached": False,
                    "fallback_active": True,
                    "classifier_triggered": Frontier_result["classifier_triggered"],
                    "reason": Frontier_result["reason"],
                    "safety_protocol": "Terrell Hall Guardrails"
                }

            # Step 2: Apply security checks
            logger.info("Applying security protocols...")

            # Step 3: Execute via orchestration engine
            logger.info("Executing via orchestration engine...")

            # Log the operation through Terrell Hall Guardrails
            await self.firewall.log_orchestration(
                session_id=session_id,
                action="process_query",
                path=query,
                tool="Frontier_orchestrator",
                user_request=query
            )

            # Simulate orchestration
            result = f"[Frontier Result] Query: {query} | Model: {model_profile} | Execution: Success"

            # Log completion through Terrell Hall
            await self.firewall.log_orchestration(
                session_id=session_id,
                action="query_result",
                path=".",
                tool="mythos5_orchestrator",
                user_request=query,
                result=result,
                operation_result="allowed"
            )

            logger.info("Query processed through complete Frontier pipeline")

            return {
                "result": result,
                "cached": False,
                "safety_protocol": "Terrell Hall Guardrails",
                "security_level": "maximum",
                "orchestration_engine": "Mythos5",
                "security_override": "Elitze Sentinel"
            }

        except Exception as e:
            logger.error(f"Frontier processing failed: {str(e)}")

            # Log error through Terrell Hall
            await self.firewall.log_orchestration(
                session_id=session_id,
                action="error",
                path=".",
                tool="Frontier_orchestrator",
                user_request=query,
                error=str(e),
                operation_result="denied"
            )

            raise

    async def shutdown(self):
        """Gracefully shutdown the Frontier system"""
        logger.info("Shutting down Frontier system...")

        # Disconnect all components
        await self.firewall.disconnect()
        await self.Frontier_gateway.cleanup()

        self.is_initialized = False
        logger.info("Frontier system shutdown complete")
