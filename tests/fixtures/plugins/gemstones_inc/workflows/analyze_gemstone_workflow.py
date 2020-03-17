from clims.workflow import CamundaWorkflow


class AnalyzeGemstoneWorkflow(CamundaWorkflow):
    """
    A workflow for analyzing gemstones.

    Since this is a CamundaWorkflow, the workflow itself is defined mostly in the associated .bpmn
    file (same name, different extension).
    """
    pass


class Sub1(AnalyzeGemstoneWorkflow):
    pass
