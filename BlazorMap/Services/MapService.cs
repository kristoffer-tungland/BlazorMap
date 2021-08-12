using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BlazorMap.Models;
using Microsoft.JSInterop;

namespace BlazorMap.Services
{
    public class MapService : IDisposable
    {
        private Action<Feature> _onPointClickAction;
        private IJSRuntime _jSRuntime;
        private DotNetObjectReference<MapService> objRef;

        public MapService(IJSRuntime jSRuntime)
        {
            _jSRuntime = jSRuntime;
        }

        public async Task Initialize(InitializeMapArgs args)
        {
            objRef = DotNetObjectReference.Create(this);
            await _jSRuntime.InvokeVoidAsync("mapService.Initialize", objRef, args);
        }

        public async Task<Layer> AddLayer(AddLayerArgs args)
        {
            var layer = await _jSRuntime.InvokeAsync<Layer>("mapService.AddLayer", args);

            return layer;
        }

        public async Task<Feature> AddIconFeature(AddIconFeatureArgs args)
        {
            var id = await _jSRuntime.InvokeAsync<string>("mapService.AddIconFeature", args);

            return new Feature
            {
                Id = id,
                LayerId = args.LayerId,
                Name = args.Name,
                Lon = args.Lon,
                Lat = args.Lat,
                Properties = args.Properties
            };
        }

        public async Task RemoveFeature(RemoveFeatureArgs args)
        {
            await _jSRuntime.InvokeVoidAsync("mapService.RemoveFeature", args);
        }

        public async Task UpdateFeatureProperties(UpdateFeaturePropertiesArgs args)
        {
            await _jSRuntime.InvokeVoidAsync("mapService.UpdateFeatureProperties", args);
        }

        public async Task UpdateFeatureLocation(UpdateFeatureLocationArgs args)
        {
            await _jSRuntime.InvokeVoidAsync("mapService.UpdateFeatureLocation", args);
        }

        public void SetOnPointClickAction(Action<Feature> action)
        {
            _onPointClickAction = action;
        }

        [JSInvokable]
        public void OnFeatureClick(Feature feature)
        {
            _onPointClickAction?.Invoke(feature);
        }

        public void Dispose()
        {
            objRef?.Dispose();
        }
    }

    public class AddLayerArgs
    {
        public double Opacity { get; set; } = 1;
        public bool Visible { get; set; } = true;
        public double ZIndex { get; set; }
    }

    public class RemoveFeatureArgs
    {
        public RemoveFeatureArgs(string layerId, string id)
        {
            Id = id;
            LayerId = layerId;
        }
        public string Id { get; }
        public string LayerId { get; }
    }

    public class InitializeMapArgs
    {
        public double Lon { get; set; }
        public double Lat { get; set; }
        public int Zoom { get; set; } = 4;
    }

    public class UpdateFeatureLocationArgs
    {
        public UpdateFeatureLocationArgs(string layerId, string id)
        {
            Id = id;
            LayerId = layerId;
        }

        public string Id { get; }
        public string LayerId { get; }
        public double Lon { get; set; }
        public double Lat { get; set; }
        public double Direction { get; set; }
        public bool CenterView { get; set; }
    }

    public class UpdateFeaturePropertiesArgs
    {
        public UpdateFeaturePropertiesArgs(string layerId, string id)
        {
            Id = id;
            LayerId = layerId;
        }

        public string Id { get; }
        public string LayerId { get; }
        public Dictionary<string, string> Properties { get; set; } = new();
    }

    public class AddIconFeatureArgs : Feature
    {
        public string ImageSource { get; set; }
    }
}
