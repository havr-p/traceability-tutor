from dataclasses import dataclass
from typing import Any, List

from jinja2 import Environment, Template


@dataclass
class RowWithReservedFieldFormObject:
    field: Any
    errors: List[str]
    jinja_environment: Environment

    def __post_init__(self):
        assert isinstance(
            self.jinja_environment, Environment
        ), self.jinja_environment

    def render(self):
        template: Template = self.jinja_environment.get_template(
            "components/grammar_form_element/row_with_reserved_field/index.jinja"
        )
        rendered_template = template.render(form_object=self)
        return rendered_template


@dataclass
class RowWithCustomFieldFormObject:
    field: Any
    errors: List[str]
    jinja_environment: Environment

    def __post_init__(self):
        assert self.field is not None
        assert isinstance(
            self.jinja_environment, Environment
        ), self.jinja_environment

    def render(self):
        template: Template = self.jinja_environment.get_template(
            "components/grammar_form_element/row_with_custom_field/index.jinja"
        )
        rendered_template = template.render(form_object=self)
        return rendered_template


@dataclass
class RowWithRelationFormObject:
    relation: Any
    errors: List[str]
    jinja_environment: Environment

    def __post_init__(self):
        assert self.relation is not None
        assert isinstance(
            self.jinja_environment, Environment
        ), self.jinja_environment

    def render(self):
        template: Template = self.jinja_environment.get_template(
            "components/grammar_form_element/row_with_relation/index.jinja"
        )
        rendered_template = template.render(form_object=self)
        return rendered_template