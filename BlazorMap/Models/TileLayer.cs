namespace BlazorMap.Models
{
    public class TileLayer
    {
        public OSM Source { get; set; } = new ();
    }

    public class OSM
    {
        public string Attributions { get; set; }
        public string Url { get; set; }
        public bool Opaque { get; set; } = true;
    }
}