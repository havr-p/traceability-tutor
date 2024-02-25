from strictdoc.backend.sdoc.models.object_factory import SDocObjectFactory
from strictdoc.backend.sdoc.models.type_system import RequirementFieldName


def test_010_full_dict():
    requirement_dict = {
        RequirementFieldName.TITLE: "REQ TITLE",
        RequirementFieldName.STATEMENT: "REQ STATEMENT",
        RequirementFieldName.UID: "ABC-123",
        RequirementFieldName.RATIONALE: "REQ RATIONALE",
    }
    document = SDocObjectFactory.create_document(title="NONAME")
    requirement = SDocObjectFactory.create_requirement_from_dict(
        requirement_dict, document, 1
    )

    assert requirement.ng_level == 1
    assert (
        requirement.reserved_uid == requirement_dict[RequirementFieldName.UID]
    )
    assert (
        requirement.reserved_title
        == requirement_dict[RequirementFieldName.TITLE]
    )
    assert (
        requirement.reserved_statement
        == requirement_dict[RequirementFieldName.STATEMENT]
    )
    assert (
        requirement.rationale
        == requirement_dict[RequirementFieldName.RATIONALE]
    )


def test_020_empty_dict():
    requirement_dict = {}
    document = SDocObjectFactory.create_document(title=None)
    requirement = SDocObjectFactory.create_requirement_from_dict(
        requirement_dict, document, 1
    )

    assert requirement.ng_level == 1
    assert requirement.reserved_uid is None
    assert requirement.reserved_title is None
    assert requirement.reserved_statement is None
    assert requirement.rationale is None
