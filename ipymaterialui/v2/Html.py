import ipywidgets as widgets
from traitlets import (
    Unicode, Enum, Instance, Union, Float, Int, List, Tuple, Dict,
    Undefined, Bool, Any
)

from .generated.ReactWidget import ReactWidget
from ipywidgets import DOMWidget
from ipywidgets.widgets.widget import widget_serialization


class Html(ReactWidget):

    _model_name = Unicode('HtmlModel').tag(sync=True)

    children = Union([
        Union([
            Unicode(),
            Instance(DOMWidget)
        ], default_value=None),
        List(Union([
            Unicode(),
            Instance(DOMWidget)
        ], default_value=None))
    ], default_value=None, allow_none=True).tag(sync=True, **widget_serialization)

    tag = Unicode(None, allow_none=True).tag(sync=True)

def divjslink(widget, property):
    div = Html(tag='div')
    widgets.jslink((widget, property), (div, 'children'))
    
    return div


__all__ = ['Html']