require 'data_mapper'

module GroupCruz
  class Cruise
    include DataMapper::Resource
    
    property :id, Serial
    property :destination, String
    property :date, Date
    property :vendor, String
    property :ship, String
    property :group_num, String
    property :product, String
    property :category_fares, String
    property :amenities, String
    property :availability, String
    
  end
  
end