from pydantic import BaseModel
from typing import Literal


class FireworkEvent(BaseModel):
    type: Literal["firework"]
    x: float        # normalized 0–1
    y: float
    color: str
    pattern: str
    timestamp: int

