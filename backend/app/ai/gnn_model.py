import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv


class PatientGNN(torch.nn.Module):

    def __init__(self, input_dim, hidden_dim=16):
        super().__init__()

        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)

        self.linear = torch.nn.Linear(hidden_dim, 1)

    def forward(self, x, edge_index):

        x = self.conv1(x, edge_index)
        x = F.relu(x)

        x = self.conv2(x, edge_index)
        x = F.relu(x)

        out = self.linear(x)

        return out