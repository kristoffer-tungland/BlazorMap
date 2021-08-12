using System;
using System.Collections.Generic;

namespace BlazorMap.Models
{
    public class Feature
    {
        public string Id { get; set; }
        public string LayerId { get; set; }
        public string Name { get; set; }
        public double Lon { get; set; }
        public double Lat { get; set; }
        public double Direction { get; set; }

        public Dictionary<string, string> Properties { get; set; } = new ();
    }
}   
